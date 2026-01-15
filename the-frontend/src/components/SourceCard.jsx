import { Download, ExternalLink } from "lucide-react"; // Optional icons

export default function SourceCard({ sources }) {
  if (!sources || sources.length === 0) return null;

  const BACKEND_URL = "http://localhost:8000"; 

  return (
    <div className="mt-3 pt-2 border-t border-gray-100">
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">
        References
      </p>
      <div className="flex flex-col gap-2">
        {sources.map((source, index) => {
          const baseUrl = `${BACKEND_URL}/pdf-files/${encodeURIComponent(source.file)}`;
          const viewUrl = `${baseUrl}#page=${source.page}`;

          return (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200 group"
            >
              {/* Left Side: View/Open Link */}
              <a 
                href={viewUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 overflow-hidden flex-grow hover:text-blue-600 transition-colors"
              >
                <span className="text-lg">📄</span>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold truncate">
                    {source.file}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    View Page {source.page}
                  </span>
                </div>
              </a>

              {/* Right Side: Download Button */}
              <a
                href={baseUrl}
                download={source.file} 
                title="Download PDF"
                className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              >
                <Download size={16} /> 
               
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}