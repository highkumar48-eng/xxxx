export default function AdBanner({ placement = "header" }) {
  const slots = {
    header: process.env.NEXT_PUBLIC_ADSTARK_HEADER_SLOT,
    feed: process.env.NEXT_PUBLIC_ADSTARK_FEED_SLOT,
    player: process.env.NEXT_PUBLIC_ADSTARK_PLAYER_SLOT,
    sidebar: process.env.NEXT_PUBLIC_ADSTARK_SIDEBAR_SLOT,
  };
  return (
    <div className={"ad-banner ad-" + placement} aria-label="Advertisement">
      {slots[placement] && process.env.NEXT_PUBLIC_ADSTARK_CLIENT_ID ? (
        <ins
          className="adstark-ad"
          data-ad-client={process.env.NEXT_PUBLIC_ADSTARK_CLIENT_ID}
          data-ad-slot={slots[placement]}
          data-ad-format="auto"
        />
      ) : (
        <>
          <span className="ad-label">AD</span>
          <span>A little space for our supporters</span>
          <span className="ad-dimensions">
            {placement === "sidebar"
              ? "300 × 600"
              : placement === "feed"
                ? "300 × 250"
                : "728 × 90"}
          </span>
        </>
      )}
    </div>
  );
}
