class Features {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find(keyword);
    return this;
  }

  // this is to sort the documents of the response in ascending or descending order
  sort() {
    // sortBy should be like "name price"
    const sortBy = this.queryStr.sort
      ? this.queryStr.sort.split(",").join(" ")
      : "createdAt";
    this.query = this.query.sort(sortBy);
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const commonFields = ["keyword", "sort", "page", "limit", "fields"];

    commonFields.forEach((el) => delete queryCopy[el]);

    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  paginate(resultPerPage = 10) {
    // page=2&limit=2
    const page = this.queryStr.page * 1 || 1;
    const skipVal = (page - 1) * resultPerPage;

    this.query = this.query.skip(skipVal).limit(resultPerPage);
    return this;
  }

  // this is to select specific fields from the response
  fields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      // console.log(req.query);
      this.query.select(fields);
    } else {
      this.query.select("-__v");
    }

    return this;
  }
}

module.exports = Features;
