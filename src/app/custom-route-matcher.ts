import { UrlSegment, UrlMatchResult }  from "@angular/router";

export function confirmEmailMatcher(segments: UrlSegment[]): UrlMatchResult | null {
    if (segments.length >= 3 && segments[0].path === 'confirm-email') {
        return {
            consumed: segments,
            posParams: {
                userId: segments[1],
                token: new UrlSegment(segments.slice(2).map(s => s.path).join('/'), {})
            }
        }
    }

    return null;
}