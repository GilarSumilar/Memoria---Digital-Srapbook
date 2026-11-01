export const MAX_STORY_WORDS = 20;

export function countStoryWords(story: string): number {
  return story.trim().match(/\S+/gu)?.length ?? 0;
}