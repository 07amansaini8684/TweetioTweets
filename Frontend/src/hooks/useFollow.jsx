import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
  const queryClient = useQueryClient();
  const {
    mutate: followUnfollow,
    isLoading,
    isPending,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Something is wrong can't follow and unfollow"
          );
        }
        return data;
      } catch (error) {
        console.error("useFollow's", error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggested-users"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  return { followUnfollow, isPending}
};

export default useFollow;
