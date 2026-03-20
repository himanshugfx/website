const fs = require('fs');

// 1. Fix ProductAnalytics
const PA_PATH = 'g:/Himanshu/website/src/components/admin/analytics/ProductAnalytics.tsx';
let pa = fs.readFileSync(PA_PATH, 'utf8');
pa = pa.replace(/Target: >/g, 'Target: &gt;');
fs.writeFileSync(PA_PATH, pa);

// 2. Fix RetentionAnalytics
const RA_PATH = 'g:/Himanshu/website/src/components/admin/analytics/RetentionAnalytics.tsx';
let ra = fs.readFileSync(RA_PATH, 'utf8');
ra = ra.replace(/style=\{\{ backgroundColor: \\\`rgba\\(147, 51, 234, \\\$\\{opacity \+ 0\.1\\}\\)\\\` \}\}/g, 'style={{ backgroundColor: `rgba(147, 51, 234, ${opacity + 0.1})` }}');
ra = ra.replace(/\{\\\$\\{val\\}%\\\}/g, '{val}%');
ra = ra.replace(/\{val === 100 \? \'\' : \\\`\\\$\\{val\\}%\\\`\}/g, '{val === 100 ? \'\' : `${val}%`}');
fs.writeFileSync(RA_PATH, ra);

// 3. Fix RevenueAnalytics
const REVA_PATH = 'g:/Himanshu/website/src/components/admin/analytics/RevenueAnalytics.tsx';
let reva = fs.readFileSync(REVA_PATH, 'utf8');
reva = reva.replace(/discountROI: data\.discountImpact > 0 \? \(data\.totalRevenue \/ data\.discountImpact\)\.toFixed\(1\) : 0/g, 'discountROI: data.discountImpact > 0 ? Number((data.totalRevenue / data.discountImpact).toFixed(1)) : 0');
fs.writeFileSync(REVA_PATH, reva);

console.log("Syntax fixes applied.");
