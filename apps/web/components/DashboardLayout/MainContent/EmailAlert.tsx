export default function EmailAlert() {
  return (
    <div className="bg-[#F5F1EA] border rounded-lg p-4 text-sm">
      A confirmation link has been sent to your mailbox, please click on it to
      confirm your account.{" "}
      <span className="underline cursor-pointer">
        Click here
      </span>{" "}
      to have the confirmation link sent again.
    </div>
  )
}
