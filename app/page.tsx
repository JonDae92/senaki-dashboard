'use client';
import { useState } from 'react';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(e.target?.result as ArrayBuffer);
          const filesToRead = ["character.json", "skill.json", "passive.json", "buff.json"];
          const analysis: Record<string, any> = {};

          await Promise.all(
            filesToRead.map(async (name) => {
              const fileData = zipContent.file(name);
              if (fileData) {
                const content = await fileData.async("string");
                analysis[name] = JSON.parse(content);
              }
            })
          );
          setResult(analysis);
        } catch (err) {
          alert("분석 실패: 올바른 asset.zip 파일인지 확인해주세요.");
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
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
      {result && (
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
      )}
    </main>
  );
}
