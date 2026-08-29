import React from 'react';

export default function ScreenplayPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      
      {/* திரைக்கதை பேப்பர் கன்டெய்னர் */}
      <div className="screenplay-sheet mx-auto bg-white shadow-xl print:shadow-none box-border">
        
        {/* Fade In */}
        <div className="script-scene font-mono font-bold uppercase tracking-wide">
          FADE IN:
        </div>

        {/* Scene Heading */}
        <div className="script-scene font-mono font-bold uppercase tracking-wide mt-6 mb-4">
          INT. WRITER'S ROOM - NIGHT
        </div>

        {/* Action / Description */}
        <div className="script-action font-mono text-base mb-4 leading-relaxed">
          Dim lamp glows. A coffee mug sits near the mechanic setup on the wooden table. Papers are scattered everywhere.
        </div>

        {/* Character Name */}
        <div className="script-character font-mono font-bold uppercase mt-6 mb-1">
          DIRECTOR
        </div>

        {/* Dialogue */}
        <div className="script-dialogue font-mono text-base mb-4 leading-relaxed">
          Let&apos;s roll the camera. We need perfection on this shot.
        </div>

      </div>

    </div>
  );
}