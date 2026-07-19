import './admin.css';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link } from "react-router-dom";




export const ReportCards = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    fetch('https://admin.thelearningsanctuary.quest/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error('Error fetching classes:', err));
  }, []);

useEffect(() => {
  setSelectedClass('');
}, [selectedYear, selectedTerm]);

const filteredClasses = classes.filter(c =>
  (!selectedYear || c.year === selectedYear) &&
  (!selectedTerm || c.term === selectedTerm)
);

// ✅ Remove duplicates (same className)
const uniqueClasses = [
  ...new Map(filteredClasses.map(c => [c.className, c])).values()
];

  const currentClass = classes.find(
    c => c.className === selectedClass && c.year === selectedYear && c.term === selectedTerm
  );

  const handleClassDownload = () => {
    if (!selectedClass || !selectedYear || !selectedTerm) {
      return alert('Please select class, year, and term first');
    }
    if (!currentClass) return;

    const studentMarks = currentClass.marks || {};

// ✅ Filter classes by selected year + term


    const subjects =
      Object.keys(studentMarks).length > 0
        ? Object.keys(studentMarks[Object.keys(studentMarks)[0]] || {})
        : [];

    const rows = [['Student', ...subjects]];
    Object.entries(studentMarks).forEach(([student, scores]) => {
      rows.push([student, ...subjects.map(sub => scores[sub] || '')]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedClass}_${selectedYear}_Term${selectedTerm}_report_cards.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleMasterDownload = () => {
    if (classes.length === 0) return alert('No class data available');

    const workbook = XLSX.utils.book_new();

    classes.forEach(cls => {
      const { className, year, term, marks } = cls;
      const studentMarks = marks || {};
      const subjectsSet = new Set();
      Object.values(studentMarks).forEach(studentScores => {
        Object.keys(studentScores || {}).forEach(sub => subjectsSet.add(sub));
      });
      const subjects = Array.from(subjectsSet);

      const data = [['Student', ...subjects]];
      Object.entries(studentMarks).forEach(([student, scores]) => {
        data.push([student, ...subjects.map(sub => scores[sub] || '')]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const sheetName = `${className}_${year}_Term${term}`.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    });

    XLSX.writeFile(workbook, 'Master_Report_Cards.xlsx');
  };

  const subjects = currentClass
    ? Object.keys(currentClass.marks?.[Object.keys(currentClass.marks)[0]] || {})
    : [];

  return (
    <div>
      <h1>Access to student report cards</h1>

      <p>
        Select class:{' '}
        <select
  value={selectedClass}
  onChange={e => setSelectedClass(e.target.value)}
  disabled={!selectedYear} // optional but recommended
>
  <option value="">-- Select a class --</option>

  {uniqueClasses
    .sort((a, b) => parseInt(a.className.split('.')[0]) - parseInt(b.className.split('.')[0]))
    .map(cls => (
      <option key={cls.className} value={cls.className}>
        {cls.className} ({Object.keys(cls.marks || {}).length} students)
      </option>
    ))}
</select>
      </p>

      <p>
        Select year:{' '}
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value="">-- Select year --</option>
          {[...new Set(classes.map(c => c.year))].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </p>

      <p>
        Select term:{' '}
        <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
          <option value="">-- Select term --</option>
          {[...new Set(classes.map(c => c.term))].map(term => (
            <option key={term} value={term}>{term}</option>
          ))}
        </select>
      </p>

      {currentClass && (
        <div>
          <h2>Preview: {selectedClass} - {selectedYear} Term {selectedTerm} Report Cards</h2>
          {subjects.length === 0 ? (
            <p>No data available for this selection.</p>
          ) : (
            <table border="1">
              <thead>
                <tr>
                  <th>Student</th>
                  {subjects.map(sub => <th key={sub}>{sub}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentClass.marks || {})
  .sort(([a], [b]) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  )
  .map(([student, scores]) => (
                  <tr key={student}>
                    <td>{student}</td>
                    {subjects.map(sub => <td key={sub}>{scores[sub] || ''}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <button onClick={handleClassDownload}>Export class report cards</button>
      <br />
      <button onClick={handleMasterDownload}>Download Master Excel (All Classes)</button>
    </div>
  );
};


