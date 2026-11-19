export default function PinchProgress({ progress }: { progress: number }) {
  return (
    <svg className="pinch-progress" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="96" height="96" rx="4" pathLength="1"
        strokeDasharray="1" strokeDashoffset={1 - progress} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
