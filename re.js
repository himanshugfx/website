const fs = require('fs');
const filepath = 'g:/Himanshu/website/src/components/admin/AnalyticsDashboard.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add dbData state and fix fetchAnalytics
content = content.replace(
    /const \[data, setData\] \= useState<AnalyticsData \| null>\(null\);\s*const \[loading, setLoading\] \= useState\(true\);\s*const \[error, setError\] \= useState<string \| null>\(null\);\s*const fetchAnalytics \= async \(\) \=> {[\s\S]*?finally {\s*setLoading\(false\);\s*}\s*};/,
    `const [data, setData] = useState<AnalyticsData | null>(null);
    const [dbData, setDbData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const [gaRes, dbRes] = await Promise.all([
                fetch('/api/admin/analytics').catch(() => null),
                fetch('/api/admin/analytics/db').catch(() => null)
            ]);
            
            let gaJson = { success: false, data: null, error: null };
            let dbJson = { success: false, data: null, error: null };
            
            if (gaRes && gaRes.ok) gaJson = await gaRes.json();
            if (dbRes && dbRes.ok) dbJson = await dbRes.json();

            if (dbJson.success && dbJson.data) {
                setDbData(dbJson.data);
            } else {
                setError(dbJson.error || 'Failed to load database analytics');
                return; // Stop if core DB data fails
            }

            if (gaJson.success && gaJson.data) {
                setData(gaJson.data);
            }
        } catch (err) {
            setError('Failed to connect to analytics endpoints');
        } finally {
            setLoading(false);
        }
    };`
);

// 2. Fix the line 94 check
content = content.replace(
    /if \(!data\) return null;\s*const totalSessions \= data\.trafficSources\.reduce.*?;/,
    `if (!dbData) return null;`
);

content = content.replace(
    /if \(!data\) return null;/,
    `if (!dbData) return null;`
);

fs.writeFileSync(filepath, content);
console.log("AnalyticsDashboard patched via JS");
