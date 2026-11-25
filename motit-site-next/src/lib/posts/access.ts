import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PostAuthor = {
  id: number;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

type PostAccess = {
  canView: boolean;
  canEdit: boolean;
  canManageCollaborators: boolean;
  role: "owner" | "editor" | "viewer" | "none";
  author: PostAuthor | null;
};

async function findPostByRef(rawId: string) {
  const num = Number(rawId);

  if (Number.isFinite(num) && num > 0) {
    const byId = await prisma.posts.findUnique({
      where: { id: num },
      select: { id: true },
    });

    if (byId) return byId.id;
  }

  const byDoc = await prisma.posts.findFirst({
    where: { document_id: rawId },
    select: { id: true },
  });

  return byDoc?.id ?? null;
}

function mapAuthor(post: {
  author: {
    id: number;
    username: string | null;
    full_name: string | null;
    avatar: {
      url: string | null;
    } | null;
  } | null;
}): PostAuthor | null {
  if (!post.author) return null;

  return {
    id: post.author.id,
    username: post.author.username ?? "",
    full_name: post.author.full_name ?? null,
    avatar_url: post.author.avatar?.url ?? null,
  };
}

export async function getPostAccess(
  postId: string,
): Promise<PostAccess> {
  const user = await getCurrentUser();

  const denied: PostAccess = {
    canView: false,
    canEdit: false,
    canManageCollaborators: false,
    role: "none",
    author: null,
  };

  if (!user) return denied;

  const numericPostId = await findPostByRef(postId);

  if (!numericPostId) return denied;

  const post = await prisma.posts.findUnique({
    where: { id: numericPostId },
    select: {
      id: true,
      author_id: true,
      author: {
        select: {
          id: true,
          username: true,
          full_name: true,
          avatar: {
            select: {
              url: true,
            },
          },
        },
      },
      collaborators: {
        where: { user_id: user.id },
        select: { role: true },
      },
    },
  });

  if (!post) return denied;

  const author = mapAuthor(post);

  if (user.isAdmin || post.author_id === user.id) {
    return {
      canView: true,
      canEdit: true,
      canManageCollaborators: true,
      role: "owner",
      author,
    };
  }

  const collaborator = post.collaborators[0];

  if (!collaborator) {
    return {
      ...denied,
      author,
    };
  }

  const role = collaborator.role === "viewer" ? "viewer" : "editor";

  return {
    canView: true,
    canEdit: role === "editor",
    canManageCollaborators: false,
    role,
    author,
  };
}

export async function addPostCollaborator(
  postId: string,
  email: string,
  role: "editor" | "viewer",
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "Требуется авторизация" };
  }

  const access = await getPostAccess(postId);

  if (!access.canManageCollaborators) {
    return { error: "Нет прав на управление соавторами" };
  }

  const numericPostId = await findPostByRef(postId);

  if (!numericPostId) {
    return { error: "Пост не найден" };
  }

  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return { error: "Пользователь с таким email не найден" };
  }

  if (user.id === currentUser.id) {
    return { error: "Нельзя добавить себя как соавтора" };
  }

  await prisma.postCollaborator.upsert({
    where: {
      post_id_user_id: {
        post_id: numericPostId,
        user_id: user.id,
      },
    },
    update: { role },
    create: {
      post_id: numericPostId,
      user_id: user.id,
      role,
    },
  });

  return { success: true };
}

export async function addPostCollaboratorById(
  postId: string,
  collaboratorUserId: number,
  role: "editor" | "viewer",
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "Требуется авторизация" };
  }

  const access = await getPostAccess(postId);

  if (!access.canManageCollaborators) {
    return { error: "Нет прав на управление соавторами" };
  }

  const numericPostId = await findPostByRef(postId);

  if (!numericPostId) {
    return { error: "Пост не найден" };
  }

  if (collaboratorUserId === currentUser.id) {
    return { error: "Нельзя добавить себя как соавтора" };
  }

  const user = await prisma.users.findUnique({
    where: { id: collaboratorUserId },
    select: { id: true },
  });

  if (!user) {
    return { error: "Пользователь не найден" };
  }

  await prisma.postCollaborator.upsert({
    where: {
      post_id_user_id: {
        post_id: numericPostId,
        user_id: user.id,
      },
    },
    update: { role },
    create: {
      post_id: numericPostId,
      user_id: user.id,
      role,
    },
  });

  return { success: true };
}

export async function removePostCollaborator(
  postId: string,
  collaboratorId: number,
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "Требуется авторизация" };
  }

  const access = await getPostAccess(postId);

  if (!access.canManageCollaborators) {
    return { error: "Нет прав на управление соавторами" };
  }

  await prisma.postCollaborator.delete({
    where: { id: collaboratorId },
  });

  return { success: true };
}

export async function getPostCollaborators(postId: string) {
  const access = await getPostAccess(postId);

  if (!access.canView) {
    return [];
  }

  const numericPostId = await findPostByRef(postId);

  if (!numericPostId) {
    return [];
  }

  return prisma.postCollaborator.findMany({
    where: { post_id: numericPostId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          full_name: true,
          email: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { created_at: "asc" },
  });
}