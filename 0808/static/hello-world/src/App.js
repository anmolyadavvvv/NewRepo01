import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import "./App.css";

const formatDate = (dateString) => {
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [prModalContent, setPrModalContent] = useState("");
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    invoke("getDetails")
      .then((response) => {
        console.log("API Response:", response);
        if (response.error) {
          setError(response.error);
        } else {
          setData(response);
        }
      })
      .catch((err) => {
        setError("Error invoking function: " + err.message);
      });
  }, []);

  const showTooltip  = (content) => {
    setTooltipContent(content );
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const openPRModal = () => {
    setPrModalContent(
      data.data.map((mr) => (
        <div className="time-item" key={mr.title}>
          <div className="time-age">{mr.age}</div>
          <div className="time-content">
            <div className="time-header">{mr.title}</div>
            <div className="time-text">Assignees: {mr.assignees}</div>
            <div className="time-text">Reviewers: {mr.reviewers}</div>
          </div>
        </div>
      ))
    );
    setIsPRModalOpen(true);
  };

  const closePRModal = () => {
    setIsPRModalOpen(false);
    setPrModalContent("");
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="timeline-container">
      {data ? (
        <div className="timeline">
          <div className="timeline-item">
            <p>1st commit</p>
            <div className="timeline-circle">
              {formatDate(data.firstCommitDate)}
            </div>
            <div className="timeline-content"></div>
          </div>
          <div className="timeline-item">
            <p>Open MR: {data.numberOfOpenMergeRequests}</p>
            <div
              className="timeline-circle"
              onClick={openPRModal}
              data-dev-time="N/A"
              data-rev-time="N/A"
            >
              {formatDate(data.openMergeRequestDate)}
            </div>
            <div className="timeline-content"></div>
          </div>
          <div className="timeline-item">
            <p>PR Merge</p>
            <div
              className="timeline-circle"
              data-dev-time={
                data.data.length > 0 ? data.data[0].devTime : "N/A"
              }
              data-rev-time={
                data.data.length > 0
                  ? data.data[data.data.length - 1].revTime
                  : "N/A"
              }
            >
              {data.completedMergeRequestDates?.length > 0
                ? formatDate(
                    data.completedMergeRequestDates[
                      data.completedMergeRequestDates.length - 1
                    ]
                  )
                : "N/A"}
            </div>
            <div className="timeline-content"></div>
          </div>
          <div
            className="timeline-arrow arrow-1"
            onMouseEnter={(e) => showTooltip(data.devTime, e)}
            onMouseLeave={hideTooltip}
          >
            devTime
          </div>

          <div
            className="timeline-arrow arrow-2"
            onMouseEnter={(e) => showTooltip(data.revTime, e)}
            onMouseLeave={hideTooltip}
          >
            revTime
          </div>
          <div className="timeline-arrow arrow-pr" onClick={openPRModal}></div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {tooltipVisible && <div className="tooltips">{tooltipContent}</div>}

      {isPRModalOpen && (
        <>
          <div className="backdrop" onClick={closePRModal}></div>
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closePRModal}>
                &times;
              </span>
              <div className="modal-body">{prModalContent}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
