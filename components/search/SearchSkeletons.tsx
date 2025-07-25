import React from 'react';

const SkeletonItem: React.FC = () => (
    <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="h-5 w-3/4 bg-slate-700 rounded mb-2"></div>
        <div className="h-3 w-full bg-slate-700 rounded"></div>
        <div className="h-3 w-5/6 bg-slate-700 rounded mt-1"></div>
    </div>
);

const SkeletonCategory: React.FC = () => (
    <div className="flex-1">
        <div className="h-8 w-1/2 bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
        </div>
    </div>
);

export const SearchSkeletons: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row gap-6 animate-pulse">
            <SkeletonCategory />
            <SkeletonCategory />
            <SkeletonCategory />
        </div>
    );
};
