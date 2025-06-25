// senaki-dashboard - Main Frontend (React + Tailwind + File Analyzer)

import { useState } from "react";

export default function SenakiDashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const zip = new JSZip();
          zip.loadAsync(e.target.result).then((zipContent) => {
            const analysis = {};
            const filesToRead = [
              "character.json",
              "skill.json",
              "passive.json",
              "buff.json"
            ];

            Promise.all(
              filesToRead.map((name) =>
                zipContent.file(name)?.async("string") || Promise.resolve(null)
              )
            ).then((contents) => {
              contents.forEach((content, idx) => {
                if (content) analysis[filesToRead[idx]] = JSON.parse(content);
              });
              setResult(analysis);
            });
          });
        } catch (err) {
          alert("분석 실패: 올바른 asset.zip 파일인지 확인해주세요.");
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    return (
      <div className="mt-6 space-y-4">
        {Object.entries(result).map(([key, data]) => (
          <div key={key} className="p-4 border rounded-xl">
            <h2 className="text-lg font-semibold">{key}</h2>
            <pre className="text-sm max-h-96 overflow-auto bg-gray-100 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">세나키 자동 분석 대시보드</h1>
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="block mb-4"
      />
      {file && <p className="text-sm text-gray-500">업로드됨: {file.name}</p>}
      {renderResult()}
    </main>
  );
}
