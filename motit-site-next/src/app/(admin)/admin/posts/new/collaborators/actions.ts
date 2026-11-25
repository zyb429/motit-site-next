"use server";

import { revalidatePath } from "next/cache";
import {
  addPostCollaboratorById,
  removePostCollaborator,
} from "@/lib/posts/access";

export async function addCollaboratorAction(
  postId: string,
  userId: number,
  role: "editor" | "viewer",
) {
  const result = await addPostCollaboratorById(postId, userId, role);


  if (result.success) {
    revalidatePath(`/admin/posts/new?id=${postId}`);
  }


  return result;
}

export async function removeCollaboratorAction(
  postId: string,
  collaboratorId: number,
) {
  const result = await removePostCollaborator(postId, collaboratorId);

  if (result.success) {
    revalidatePath(`/admin/posts/new?id=${postId}`);
  }

  return result;
}