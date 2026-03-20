export function formatDate(date: Date | string | number): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB'); // en-GB is DD/MM/YYYY
}

export function formatDistance(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(date);
}

export function numberToWords(num: number): string {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const g = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    const makeGroup = ([ones, tens, huns]: number[]) => {
        return [
            huns > 0 ? `${a[huns]} Hundred` : '',
            tens === 1 ? a[10 + ones] : [b[tens], a[ones]].join(' ').trim()
        ].join(' ').trim();
    };

    const formatWords = (num: number): string => {
        if (num === 0) return 'Zero';
        
        const groups: number[] = [];
        let n = Math.floor(num);
        while (n > 0) {
            groups.push(n % 1000);
            n = Math.floor(n / 1000);
        }

        return groups.map((group, i) => {
            if (group === 0) return '';
            const gNum = [group % 10, Math.floor((group % 100) / 10), Math.floor(group / 100)];
            return `${makeGroup(gNum)} ${g[i]}`.trim();
        }).filter(Boolean).reverse().join(' ');
    };

    const words = formatWords(Math.floor(num));
    const paisa = Math.round((num % 1) * 100);

    let result = `${words} Rupees`;
    if (paisa > 0) {
        result += ` and ${formatWords(paisa)} Paisa`;
    }
    return result + ' Only';
}
