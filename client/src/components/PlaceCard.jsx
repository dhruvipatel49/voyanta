export default function PlaceCard({ place, action }) {
  return (
    <div className="place-card">
      <div className="place-info">
        <h4>
          {place.name}
          {place.is_hidden_gem && <span className="gem-badge">💎 Hidden Gem</span>}
        </h4>
        <div className="place-meta">
          <span className={`badge badge-${place.category}`}>{place.category}</span>
          <span>⭐ {place.rating}</span>
          <span>⏱ {place.average_visit_duration_hours}h</span>
          <span>🕐 {place.best_time_of_day}</span>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
