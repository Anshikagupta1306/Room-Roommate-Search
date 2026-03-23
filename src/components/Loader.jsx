// Skeleton Loader Component
const JobCardSkeleton = () => (
    <div className="job-card-modern skeleton-loader">
        <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text-container">
                <div className="skeleton-text medium"></div>
                <div className="skeleton-text small"></div>
            </div>
        </div>
        <div className="skeleton-title"></div>
        <div className="skeleton-description">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-tags">
            <div className="skeleton-tag"></div>
            <div className="skeleton-tag"></div>
            <div className="skeleton-tag"></div>
        </div>
        <div className="skeleton-actions">
            <div className="skeleton-button"></div>
            <div className="skeleton-icon-group">
                <div className="skeleton-icon"></div>
                <div className="skeleton-icon"></div>
            </div>
        </div>
    </div>
);

const FilterSkeleton = () => (
    <div className="filters-sidebar skeleton-loader">
        <div className="skeleton-filter-header">
            <div className="skeleton-filter-title"></div>
            <div className="skeleton-filter-count"></div>
        </div>
        {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-filter-section">
                <div className="skeleton-filter-section-header"></div>
            </div>
        ))}
    </div>
);

export { JobCardSkeleton, FilterSkeleton };