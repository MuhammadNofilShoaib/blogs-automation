'use client';

import { useState, FormEvent } from 'react';

export default function GenerateBlogForm() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate blog');
      }

      setTitle('');
      setTopic('');
      alert('Blog generated and uploaded to Sanity!');
    } catch (error) {
      console.error(error);
      alert('There was an error generating the blog.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 mb-6">
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <input
        placeholder="Topic"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Blog'}
      </button>
    </form>
  );
}
