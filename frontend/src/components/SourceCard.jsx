// export default function SourceCard({ sources }) {
//   if (!sources || !Array.isArray(sources) || sources.length === 0) return null;

//   return (
//     <div className="mt-2 text-xs text-black border rounded p-2 bg-white shadow-sm">
//       <p className="font-semibold">Sources:</p>
//       <ul className="list-disc ml-4">
//         {sources.map((s, idx) => (
//           <li key={idx}>
//             <a
//               href={`http://localhost:8000/docs/${s.source}#page=${s.page || 1}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 underline"
//             >
//               {s.source} {s.page && `(Page ${s.page})`}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }


export default function SourceCard({ source }) {
  if (!source) return null;

  return (
    <div className="border rounded p-2 text-xs bg-gray-50">
      <p className="font-semibold">{source.title}</p>
      {source.section && (
        <p>Section: {source.section}</p>
      )}
      {source.page && (
        <p>Page: {source.page}</p>
      )}
    </div>
  );
}
