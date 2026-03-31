const timeUnits = [
    { name: 'year',   value: 31_536_000 },
    { name: 'month',  value: 2_592_000 },
    { name: 'week',   value: 604_800 },
    { name: 'day',    value: 86_400 },
    { name: 'hour',   value: 3_600 },
    { name: 'minute', value: 60 },
];

export const formatLastSeen = (lastSeenTime: number, nowTime: number): string => {
    const difference = Math.floor((nowTime - lastSeenTime) / 1000); // seconds difference
    if (difference < 60) return "last seen just now";

    for (const unit of timeUnits) {
        if (difference >= unit.value) {
            const unitCount = Math.floor(difference / unit.value);
            const unitName = unit.name + (unitCount > 1 ? 's' : '');
            return `last seen ${unitCount} ${unitName} ago`;
        }
    }
    
    return "last seen a long time ago";
} 