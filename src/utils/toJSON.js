/**
 * Converts Mongoose doc(s) to plain objects with `id` instead of `_id`.
 */
function toJSON(doc) {
  if (!doc) return null;
  if (Array.isArray(doc)) return doc.map((d) => toJSON(d));
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, ...rest } = obj;
  return { ...rest, id: _id?.toString?.() ?? _id };
}

module.exports = { toJSON };
