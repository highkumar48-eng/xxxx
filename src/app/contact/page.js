export const metadata = { title: "Contact" };
export default function Contact() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com";
  return (
    <div className="page-wrap legal-page">
      <p className="eyebrow">SAY HELLO</p>
      <h1>
        Let’s talk<span>.</span>
      </h1>
      <p className="intro">Questions, feedback, or a removal request?</p>
      <div className="legal-copy">
        <h2>Contact the creator</h2>
        <p>
          Email{" "}
          <a className="contact-link" href={`mailto:${email}`}>
            {email}
          </a>{" "}
          with the page URL and a short description of how we can help.
        </p>
        <p>
          For media removal requests, include enough information to identify the
          item and explain your relationship to it. We aim to respond within a
          reasonable time.
        </p>
      </div>
    </div>
  );
}
