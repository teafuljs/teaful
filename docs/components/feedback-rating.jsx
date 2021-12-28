import React from 'react';

const FeedbackRating = () => {
  
  const sendYes = () => {
    window.ga('send', {
      hitType: 'event',
      origin: window.location.origin,
      pathname: window.location.pathname,
      category: 'Feedback',
      title: 'Was this helpful?',
      value: 'Yes'
    })
  };

  const sendMaybe = () => {
    window.ga('send', {
      hitType: 'event',
      origin: window.location.origin,
      pathname: window.location.pathname,
      category: 'Feedback',
      title: 'Was this helpful?',
      value: 'Maybe'
    })
  };

  const sendNo = () => {
    window.ga('send', {
      hitType: 'event',
      origin: window.location.origin,
      pathname: window.location.pathname,
      category: 'Feedback',
      title: 'Was this helpful?',
      value: 'No'
    })
  };

  return (
    <div className="w-full flex flex-col justify-center items-center mt-8">
      <h3>Was this helpful?</h3>
      <div className="mt-6 text-gray-700 dark:text-gray-400 space-x-6">
        <button onClick={sendNo} title="No" className="hover:text-red-400 transition">
          <svg aria-label="No" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
        <button onClick={sendMaybe} title="Maybe" className="hover:text-yellow-400 transition">
          <svg aria-label="Maybe" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
        <button onClick={sendYes} title="Yes" className="hover:text-green-400 transition">
          <svg aria-label="Yes" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
      </div>
    </div>
  );
};

export default FeedbackRating;
