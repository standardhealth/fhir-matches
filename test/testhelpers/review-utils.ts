import { Review } from '../../src/reviewers';

export function getReview(reviews: Review[], id: string, path?: string) {
  const matches = reviews.filter(r => {
    if (r.a.id === id) {
      return path == null || r.a.path === path;
    } else if (r.b.id === id) {
      return path == null || r.b.path === path;
    }
    return false;
  });
  if (matches.length > 1) {
    throw 'Only expected one review to match';
  } else if (matches.length === 1) {
    return matches[0];
  }
  return null;
}
