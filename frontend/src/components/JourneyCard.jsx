export default function JourneyCard({ data }) {
  return (
    <div>
      {data.map((res, i) => (
        <div key={i}>
          <h3>{res.name}</h3>
          <p>{res.summary}</p>
        </div>
      ))}
    </div>
  );
}
