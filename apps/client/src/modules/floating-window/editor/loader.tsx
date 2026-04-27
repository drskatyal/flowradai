export default function BarsLoader() {
    return (
      <div className="flex items-center justify-center">
        <div className="flex gap-2">
          <span className="loader-bar animate-bar1"></span>
          <span className="loader-bar animate-bar2"></span>
          <span className="loader-bar animate-bar3"></span>
        </div>
  
        <style>{`
          .loader-bar {
            width: 8px;
            height: 20px;
            background-color: #d4d4d4;
            border-radius: 4px;
            display: inline-block;
            transform-origin: center bottom;
          }
  
          @keyframes barPulse {
            0% { transform: scaleY(1); opacity: 0.6; }
            50% { transform: scaleY(1.8); opacity: 1; }
            100% { transform: scaleY(1); opacity: 0.6; }
          }
  
          .animate-bar1 {
            animation: barPulse 0.8s infinite ease-in-out;
            animation-delay: 0s;
          }
          .animate-bar2 {
            animation: barPulse 0.8s infinite ease-in-out;
            animation-delay: 0.15s;
          }
          .animate-bar3 {
            animation: barPulse 0.8s infinite ease-in-out;
            animation-delay: 0.3s;
          }
        `}</style>
      </div>
    );
  }
  