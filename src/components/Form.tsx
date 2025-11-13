import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
}

interface FormIssue {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: string;
  assigneeId: number;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onSave: (issue: FormIssue) => void;
  initialData?: FormIssue; // For editing
}

const IssueForm: React.FC<Props> = ({ onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    (initialData?.priority === 'low' || initialData?.priority === 'medium' || initialData?.priority === 'high')
      ? initialData.priority
      : 'low'
  );
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || 0);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from public/db.json
  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) {
    alert('Title is required');
    return;
  }

  const newIssue: FormIssue = {
    id: initialData?.id ?? Date.now(), // Use existing id or generate a new one
    title,
    description,
    priority,
    assigneeId: Number(assigneeId),
    status: 'todo', // Set status to 'To Do' by default
    createdAt: new Date().toISOString(), // Add created date
  };

  onSave(newIssue);
};

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="issue-form">
        <h2>{initialData ? 'Edit Issue' : 'Create New Issue'}</h2>

        <label>Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />

        <label>Priority</label>
        <select value={priority} onChange={e => setPriority(e.target.value as any)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label>Assignee</label>
        <select value={assigneeId} onChange={e => setAssigneeId(Number(e.target.value))}>
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <div className="form-buttons">
          <button type="submit">{initialData ? 'Update' : 'Create'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default IssueForm;
