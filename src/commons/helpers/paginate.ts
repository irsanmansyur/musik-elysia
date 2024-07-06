export const paginate = ({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) => {
  const offset = (+page - 1) * limit;
  return { offset, limit, page: +page };
};

export class TPaginate {
  search?: string;
  limit?: string;
  page?: string;
}
