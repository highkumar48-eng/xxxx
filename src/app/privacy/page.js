export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <div className="page-wrap legal-page">
      <p className="eyebrow">A SIMPLE PROMISE</p>
      <h1>
        Your privacy matters<span>.</span>
      </h1>
      <p className="intro">Last updated September 2026</p>
      <div className="legal-copy">
        <h2>What VidShare stores</h2>
        <p>
          VidShare stores the media, titles, descriptions, tags, and view counts
          that the creator uploads. Visitors can browse published media without
          creating an account.
        </p>
        <h2>Technical information</h2>
        <p>
          The service may receive basic request information needed to deliver
          pages, protect the creator studio, prevent abuse, and count views.
          Advertising partners may use cookies or similar technologies when ads
          are enabled. Their use is governed by the partner’s own privacy
          policy.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions or removal requests, contact the site owner
          through the address listed on the Contact page.
        </p>
      </div>
    </div>
  );
}
