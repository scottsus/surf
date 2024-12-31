import { notificationSchema } from "@repo/ai-schemas";
import { experimental_useObject as useObject } from "ai/react";

export default function Page() {
  const { object, submit } = useObject({
    api: `http://localhost:3000/api/notifications`,
    schema: notificationSchema,
  });

  return (
    <>
      <button onClick={() => submit("Messages during finals week.")}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </>
  );
}
