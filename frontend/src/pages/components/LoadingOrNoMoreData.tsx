import { loadingOrNoMoreData } from "./ComponentsStyles";

interface LoadingOrNoMoreDataProps{
    isLoading: boolean;
    hasMore: boolean;
}

const LoadingOrNoMoreData = ({isLoading, hasMore}: LoadingOrNoMoreDataProps) => {
  return (
    <div className={loadingOrNoMoreData}>
        {isLoading && (
            <div className="loading-data">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {!hasMore && (
            <div className="no-more-data"></div>
          )}
    </div>
  )
}

export default LoadingOrNoMoreData