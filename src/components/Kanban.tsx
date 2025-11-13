import React, { useEffect, useState , useCallback} from 'react';
import Column from './Column';
import IssueForm from './Form';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

interface Issue {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: string;
  assigneeId: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
}

interface ColumnData {
  title: string;
  issues: Issue[];
}

const Kanban: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterAssigneeId, setFilterAssigneeId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

 useEffect(() => {
  const localData = localStorage.getItem('issues');
  if (localData) {
    const issues = JSON.parse(localData);
    updateColumns(issues);

    // Also get users from localStorage or fallback to db.json users
    const localUsers = localStorage.getItem('users');
    if (localUsers) {
      setUsers(JSON.parse(localUsers));
    } else {
      fetch('/db.json')
        .then(res => res.json())
        .then(data => {
          setUsers(data.users);
          localStorage.setItem('users', JSON.stringify(data.users));
        })
        .catch(err => console.error('Failed to load db.json users', err));
    }
  } else {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const issues: Issue[] = data.issues;
        setUsers(data.users);
        localStorage.setItem('issues', JSON.stringify(issues));
        localStorage.setItem('users', JSON.stringify(data.users));
        updateColumns(issues);
      })
      .catch(err => console.error('Failed to load db.json', err));
  }
}, []);


  useEffect(() => {
    const localData = localStorage.getItem('issues');
    if (localData) {
      const issues = JSON.parse(localData);
      updateColumns(issues);
    } else {
      fetch('/db.json')
        .then((res) => res.json())
        .then((data) => {
          const issues: Issue[] = data.issues;
          localStorage.setItem('issues', JSON.stringify(issues));
          updateColumns(issues);
        })
        .catch((err) => console.error('Failed to load db.json', err));
    }
  }, []);

  useEffect(() => {
    const issues = JSON.parse(localStorage.getItem('issues') || '[]');
    updateColumns(issues);
  }, [filterAssigneeId, filterPriority, searchTerm]);

  const updateColumns = (issues: Issue[]) => {
    const filtered = issues.filter((issue) => {
      const matchAssignee =
        filterAssigneeId === null || issue.assigneeId === filterAssigneeId;
      const matchPriority =
        !filterPriority || issue.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchSearch =
        searchTerm.trim() === '' ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchAssignee && matchPriority && matchSearch;
    });

    const columnsByStatus: Record<string, Issue[]> = {
      'To Do': [],
      'In Progress': [],
       'Review': [],
       'Done': [],
    };

    filtered.forEach((issue) => {
      const statusMap: Record<string, string> = {
        todo: 'To Do',
        inprogress: 'In Progress',
        review: 'Review',
        done: 'Done',
      };
      const status = statusMap[issue.status];
      if (status && columnsByStatus[status]) {
        columnsByStatus[status].push(issue);
      }
    });

    setColumns([
      { title: 'To Do', issues: columnsByStatus['To Do'] },
      { title: 'In Progress', issues: columnsByStatus['In Progress'] },
      { title: 'Review', issues: columnsByStatus['Review'] },
      { title: 'Done', issues: columnsByStatus['Done'] },
    ]);
  };

  const handleSaveIssue = (formIssue: any) => {
    const newIssue: Issue = {
      ...formIssue,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'todo',
    };

    const storedIssues: Issue[] = JSON.parse(localStorage.getItem('issues') || '[]');
    const updatedIssues = [...storedIssues, newIssue];

    localStorage.setItem('issues', JSON.stringify(updatedIssues));
    updateColumns(updatedIssues);
    setShowForm(false);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const issues: Issue[] = JSON.parse(localStorage.getItem('issues') || '[]');

    const statusMapReverse: Record<string, string> = {
      'To Do': 'todo',
      'In Progress': 'inprogress',
      Review: 'review',
      Done: 'done',
    };

    const sourceStatus = statusMapReverse[source.droppableId];
    const destStatus = statusMapReverse[destination.droppableId];

    const sourceIssues = issues.filter((i) => i.status === sourceStatus);
    const destIssues = issues.filter((i) => i.status === destStatus);

    const draggedIssue = sourceIssues[source.index];

    if (source.droppableId === destination.droppableId) {
      // reorder in same column
      const reordered = Array.from(sourceIssues);
      reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, draggedIssue);

      // no explicit order property? Just save as is:
      // update original issues with reordered issues in this status
      const newIssues = issues.map((issue) =>
        issue.status === sourceStatus
          ? reordered.find((i) => i.id === issue.id) || issue
          : issue
      );

      localStorage.setItem('issues', JSON.stringify(newIssues));
      updateColumns(newIssues);
    } else {
      // moved to different column
      draggedIssue.status = destStatus as Issue['status'];

      // remove dragged issue from sourceIssues & insert into destIssues
      const newSourceIssues = Array.from(sourceIssues);
      newSourceIssues.splice(source.index, 1);

      const newDestIssues = Array.from(destIssues);
      newDestIssues.splice(destination.index, 0, draggedIssue);

      // filter out old source and dest issues from issues
      let newIssues = issues.filter(
        (issue) => issue.status !== sourceStatus && issue.status !== destStatus
      );

      // add updated source and dest issues back
      newIssues = [...newIssues, ...newSourceIssues, ...newDestIssues];

      localStorage.setItem('issues', JSON.stringify(newIssues));
      updateColumns(newIssues);
    }
  };

  return (
    <div className="kanban-container">
      <header className="kanban-header">
        <h1 className="kanban-title">Issue Tracker Kanban Board</h1>

        <div className="kanban-controls">
          <button className="create-issue-btn" onClick={() => setShowForm(true)}>
            Create Issue
          </button>

          <select
            className="assignee-filter"
            value={filterAssigneeId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setFilterAssigneeId(val === '' ? null : Number(val));
            }}
          >
            <option value="">Filter by Assignee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            className="priority-filter"
            value={filterPriority ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setFilterPriority(val === '' ? null : val);
            }}
          >
            <option value="">Filter by Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="kanban-board">
          {columns.map((col) => (
            <Droppable key={col.title} droppableId={col.title}>
              {(provided) => (
                <Column
                  title={col.title}
                  issues={col.issues}
                  provided={provided}
                />
              )}
            </Droppable>
          ))}
        </main>
      </DragDropContext>

      {showForm && (
        <div className="modal">
          <IssueForm onClose={() => setShowForm(false)} onSave={handleSaveIssue} />
        </div>
      )}
    </div>
  );
};

export default Kanban;
