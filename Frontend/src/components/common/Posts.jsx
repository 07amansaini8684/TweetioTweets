import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  // const isLoading = false;

  const getPostEndpoint = () => {
    // checking if the feedtype id for you or following
    //first we have to get for you
    if (feedType === "forYou") {
      return "/api/posts/allposts";
    } else if (feedType === "following") {
      return "/api/posts/following";
    } else if (feedType === "posts") {
      return `/api/posts/user/${username}`;
    } else if (feedType === "likes") {
      return `/api/posts/likedposts/${userId}`;
    } else {
      return "/api/posts/allposts";
    }
  };
  const Post_EndPoint = getPostEndpoint();
  const {
    data: PostData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(Post_EndPoint);
        const data = await res.json();
        // checking if the res is ok
        if (!res.ok) {
          {
            throw new Error(res.message || "Something went wrong");
          }
        }
        return data;
      } catch (error) {
        console.error("in posts.jsx", error);
        throw new Error(error);
      }
    },
  });
  // console.log("tis is the postdata",PostData)
  useEffect(() => {
    refetch();
  }, [feedType, refetch,username]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && PostData?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && PostData && (
        <div>
          {PostData.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
