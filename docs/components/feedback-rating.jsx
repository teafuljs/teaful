import React from 'react';

function ga(event) {
  console.table(event);
}

const FeedbackRating = () => {
  
  const sendYes = () => {
    ga({
      origin: window.location.origin,
      pathname: window.location.pathname,
      category: 'Feedback',
      title: 'Was this helpful?',
      value: 'Yes'
    })
  };

  const sendMaybe = () => {
    ga({
      origin: window.location.origin,
      pathname: window.location.pathname,
      category: 'Feedback',
      title: 'Was this helpful?',
      value: 'Maybe'
    })
  };

  const sendNo = () => {
    ga({
      origin: window.location.origin,
      pathname: window.location.pathname,
      category: 'Feedback',
      title: 'Was this helpful?',
      value: 'No'
    })
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
      <h3>Was this helpful?</h3>
      <div style={{ marginTop: '1.5rem', color: '#454545' }}>
        <button onClick={sendNo} title="No">
          <svg aria-label="No" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
        <button style={{ margin: '0 1.25rem' }} onClick={sendMaybe} title="Maybe">
          <svg aria-label="Maybe" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
        <button onClick={sendYes} title="Yes">
          <svg aria-label="Yes" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
      </div>
    </div>
  );
};

export default FeedbackRating;
