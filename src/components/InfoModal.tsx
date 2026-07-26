import React from 'react';
import { X, BookOpen, Info } from 'lucide-react';
import { SUPPORTED_FORMATS } from '../lib/binary/types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              바이너리 파일 포맷 가이드 & 기능 안내
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl space-y-1 text-slate-200">
            <div className="flex items-center space-x-2 font-bold text-cyan-400 text-sm">
              <Info className="w-4 h-4" />
              <span>OmniHex 변환기 주요 특징</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              OmniHex는 모든 파싱과 변환을 <strong>100% 사용자 브라우저 내부(Local Web Application)</strong>에서 처리합니다.
              파일 데이터가 서버로 업로드되지 않으므로 보안성이 완벽하고, 오프라인 환경에서도 인터넷 없이 바로 사용 가능합니다.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              지원 포맷 상세 설명
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUPPORTED_FORMATS.map((fmt) => (
                <div key={fmt.id} className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm text-cyan-300">
                      {fmt.name}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                      {fmt.extensions.join(', ')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {fmt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              고급 변환 파라미터 활용 가이드
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
              <li><strong className="text-slate-200">Base Address Shift:</strong> STM32/MCU의 Flash 시작 주소(0x08000000)를 Raw Binary로 변환 시 오프셋을 조정하여 원본 데이터만 정밀 추출할 때 사용합니다.</li>
              <li><strong className="text-slate-200">Gap Fill Byte:</strong> 불연속 메모리 구간(Sparse Memory) 사이에 비어있는 주소를 Flash 지움 상태인 0xFF 또는 0x00으로 채워넣습니다.</li>
              <li><strong className="text-slate-200">Endian Byte Swap:</strong> 16-bit 또는 32-bit 단위로 바이트 순서를 반전시켜 빅엔디안/리틀엔디안 시스템 간 데이터 호환성을 확보합니다.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
