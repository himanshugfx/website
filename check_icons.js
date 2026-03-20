const x = require('lucide-react');
const icons = ['MapPin', 'Globe', 'TrendingUp', 'FileText', 'Loader2', 'RefreshCw', 'AlertCircle', 'IndianRupee', 'TrendingDown', 'RefreshCcw', 'Tag', 'CreditCard', 'BarChart2', 'Package', 'AlertTriangle', 'ArrowUpRight', 'ArrowDownRight', 'Layers', 'ShoppingBag', 'Heart', 'MessageCircle', 'Star', 'Search', 'ThumbsUp', 'HelpCircle', 'Users', 'Calendar', 'Clock', 'RotateCcw', 'Award'];

const missing = [];
for (const icon of icons) {
    if (!x[icon]) {
        missing.push(icon);
    }
}
if (missing.length > 0) {
    console.log('Missing icons:', missing.join(', '));
} else {
    console.log('All icons found!');
}
