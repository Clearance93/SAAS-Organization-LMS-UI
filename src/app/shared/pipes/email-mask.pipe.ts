import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailMask'
})
export class EmailMaskPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const parts = value.split('@');
    if (parts.length === 2) {
      const [local, domain] = parts;
      if (local.length <= 2) return '***@' + domain;
      const visible = local[0] + '***' + local[local.length - 1];
      return `${visible}@${domain}`;
    }

    // If not an email, mask generic IDs (show first 4 and last 4)
    const len = value.length;
    if (len <= 8) return '****';
    const start = value.slice(0, 4);
    const end = value.slice(-4);
    return `${start}****${end}`;
  }
}
