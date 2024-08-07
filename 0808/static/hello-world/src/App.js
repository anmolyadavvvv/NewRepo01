import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import "./App.css";

const formatDate = (dateString) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="timeline-container">
      {data ? (
        <div className="timeline">
          <div className="timeline-item">
            <h3> 1st commit</h3>
            <div className="timeline-circle">
              {formatDate(data.firstCommitDate)}
            </div>
            <div className="timeline-content"></div>
          </div>
          <div className="timeline-item">
            <h3>Open MR: {data.numberOfOpenMergeRequests}</h3>
            <div className="timeline-circle" onClick={openModal}>
              {formatDate(data.openMergeRequestDate)}
            </div>
            <div className="timeline-content"></div>
          </div>
          <div className="timeline-item">
            <h3>PR Merge</h3>
            <div className="timeline-circle">
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
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>

            <h1>Merge-request Timeline</h1>
            <div className="time-container">
              <div className="time-line"></div>
              <div className="time-dot"></div>
              {Array.isArray(data.data) ? (
                data.data.map((mr, index) => (
                  <div className="time-item" key={index}>
                    <div className="time-age">{mr.age}</div>
                    <div className="time-content">
                      <div className="time-header">{mr.title}</div>
                      <div className="time-text">Assignees: {mr.assignees}</div>
                      <div className="time-text">Reviewers: {mr.reviewers}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No merge requests available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
