export function ok(data) {
  return {
    statusCode: 200,
    body: { data },
  };
}

export function created(data) {
  return {
    statusCode: 201,
    body: { data },
  };
}

export function noContent() {
  return {
    statusCode: 204,
    body: null,
  };
}
