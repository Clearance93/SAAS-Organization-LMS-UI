import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], property: string, value: any): any[] {
    if (!items || !property) {
      return items;
    }

    if (value === undefined || value === null || value === '') {
      return items;
    }

    return items.filter(item => {
      const nestedValue = this.getNestedProperty(item, property);

      if (nestedValue === undefined || nestedValue === null) {
        return false;
      }

      if (Array.isArray(nestedValue)) {
        return nestedValue.includes(value);
      }

      if (nestedValue === value) {
        return true;
      }

      const itemValue = String(nestedValue).toLowerCase();
      const searchValue = String(value).toLowerCase();
      
      return itemValue === searchValue || itemValue.includes(searchValue);
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => 
      current ? current[prop] : undefined, obj
    );
  }
}