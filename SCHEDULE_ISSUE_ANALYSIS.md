# Schedule Not Showing on Student Dashboard - Issue Analysis

## Problem
When a teacher creates a schedule using "Add Today's Class", it appears on the teacher's dashboard but NOT on the student's dashboard.

## Root Cause Analysis

### Teacher Side (Working)
**API Endpoint**: `POST https://localhost:7270/api/TeachersSchedule/classSchedule`

**Payload Structure**:
```json
{
  "classScheduleId": "00000000-0000-0000-0000-000000000000",
  "organizationId": "teacher's org ID",
  "teacherId": "teacher's ID",
  "gradeStreamId": "selected stream ID",
  "teachingClassId": "teaching class ID",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "classRoomNumber": "Room 201",
  "subject": "Mathematics",
  "streamName": "Grade 10 - Mathematics"
}
```

### Student Side (Not Working)
**API Endpoint**: `GET https://localhost:7270/api/SchoolDashboards/schedule/{studentId}?date=2024-01-15`

**Expected Response**: Array of schedule items for the student

## The Missing Link

The issue is that the backend needs to:
1. Take the `studentId` from the request
2. Find all subjects/streams the student is enrolled in
3. Match those streams with schedules created by teachers for those `gradeStreamId`s
4. Return the matching schedules

## Backend Fix Required

The backend endpoint `GET /api/SchoolDashboards/schedule/{studentId}` needs to:

```csharp
// Pseudo-code for backend fix
public async Task<List<ScheduleDto>> GetStudentSchedule(string studentId, string date)
{
    // 1. Get all student's enrolled subjects/streams
    var studentSubjects = await _context.StudentGrades
        .Where(sg => sg.StudentId == studentId)
        .Select(sg => sg.StreamGradeId)
        .ToListAsync();
    
    // 2. Get schedules for those streams on the specified date
    var schedules = await _context.ClassSchedules
        .Where(cs => studentSubjects.Contains(cs.GradeStreamId) 
                  && cs.Date == date)
        .Include(cs => cs.Teacher)
        .Select(cs => new ScheduleDto
        {
            Time = $"{cs.StartTime} - {cs.EndTime}",
            Subject = cs.Subject,
            Teacher = $"{cs.Teacher.FirstName} {cs.Teacher.LastName}",
            Room = cs.ClassRoomNumber
        })
        .ToListAsync();
    
    return schedules;
}
```

## Database Tables Involved

1. **ClassSchedules** (or TeacherSchedules)
   - ClassScheduleId
   - TeacherId
   - GradeStreamId ← KEY FIELD
   - Date
   - StartTime
   - EndTime
   - Subject
   - ClassRoomNumber

2. **StudentGrades** (or StudentSubjects)
   - StudentId
   - StreamGradeId ← KEY FIELD (must match GradeStreamId)
   - Subject
   - TeacherId

## Quick Test to Verify

1. Check if student is enrolled in the same `gradeStreamId` as the schedule:
   ```sql
   SELECT * FROM StudentGrades WHERE StudentId = 'student-id-here'
   ```

2. Check if schedule exists for that stream:
   ```sql
   SELECT * FROM ClassSchedules 
   WHERE GradeStreamId = 'stream-id-here' 
   AND Date = '2024-01-15'
   ```

3. If both exist but student doesn't see it, the backend API is not joining them correctly.

## Frontend is Correct

The frontend code is working correctly:
- Teacher: Sends `gradeStreamId` when creating schedule ✅
- Student: Calls schedule API with `studentId` ✅

The issue is in the **backend API logic** that needs to connect students to schedules via `gradeStreamId`.

## Recommended Backend Fix

Update the `SchoolDashboardsController.cs` method:

```csharp
[HttpGet("schedule/{studentId}")]
public async Task<IActionResult> GetStudentSchedule(string studentId, [FromQuery] string date)
{
    try
    {
        // Get student's enrolled streams
        var studentStreams = await _context.StudentGrades
            .Where(sg => sg.StudentId == studentId)
            .Select(sg => sg.StreamGradeId)
            .Distinct()
            .ToListAsync();

        // Get schedules for those streams
        var schedules = await _context.ClassSchedules
            .Where(cs => studentStreams.Contains(cs.GradeStreamId) 
                      && cs.Date == DateTime.Parse(date))
            .Include(cs => cs.Teacher)
            .OrderBy(cs => cs.StartTime)
            .Select(cs => new
            {
                time = $"{cs.StartTime} - {cs.EndTime}",
                subject = cs.Subject,
                teacher = $"{cs.Teacher.FirstName} {cs.Teacher.LastName}",
                room = cs.ClassRoomNumber,
                startTime = cs.StartTime,
                endTime = cs.EndTime,
                teacherName = $"{cs.Teacher.FirstName} {cs.Teacher.LastName}",
                classroom = cs.ClassRoomNumber,
                subjectName = cs.Subject
            })
            .ToListAsync();

        return Ok(schedules);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error: {ex.Message}");
    }
}
```

## Summary

**Problem**: Backend API doesn't link students to teacher schedules via `gradeStreamId`

**Solution**: Update backend `GET /api/SchoolDashboards/schedule/{studentId}` to:
1. Get student's enrolled `gradeStreamId`s
2. Find schedules matching those streams
3. Return the schedules

**Frontend**: No changes needed - already working correctly!
