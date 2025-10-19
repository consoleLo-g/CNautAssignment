import { useForm } from "react-hook-form";

export default function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    const res = await fetch("http://localhost:8080/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert("✅ User created!");
      onSuccess();
      reset();
    } else {
      alert("❌ Failed to create user");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
      <input {...register("username", { required: true })} placeholder="Username" className="border p-2 w-full" />
      <input {...register("age", { required: true, min: 1 })} type="number" placeholder="Age" className="border p-2 w-full" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
        Add User
      </button>
    </form>
  );
}
