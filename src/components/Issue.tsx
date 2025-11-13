

import React from 'react';

interface IssueProps {
  title: string;
  description?: string;
}

const Issue: React.FC<IssueProps> = ({ title, description }) => {
  return (
    <div className="issue-card">
      <h4>{title}</h4>
      {description && <p>{description}</p>}
    </div>
  );
};

export default Issue;