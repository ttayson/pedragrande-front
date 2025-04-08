// API utility functions for making requests to the backend

/**
 * Generic fetch function with error handling
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `API error: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export const api = {
  getAll: async <T>(
    url: string,
    params?: Record<string, string>
  ): Promise<T> => {
    let queryUrl = url;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      if (queryString) {
        queryUrl += `?${queryString}`;
      }
    }

    return fetchApi<T>(queryUrl);
  },
  /**
   * Fetch a single item by ID
   */
  getById: async <T>(url: string, id: string): Promise<T> => {
    return fetchApi<T>(`${url}/${id}`);
  },
  /**
   * Create a new item
   */
  create: async <T>(url: string, data: any): Promise<T> => {
    return fetchApi<T>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },
  /**
   * Update an existing item
   */
  update: async <T>(url: string, id: string, data: any): Promise<T> => {
    return fetchApi<T>(`${url}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },
  /**
   * Delete an item
   */
  delete: async <T>(url: string, id: string): Promise<T> => {
    return fetchApi<T>(`${url}/${id}`, {
      method: "DELETE",
    });
  },
  /**
   * Direct access to the fetchApi function
   */
  fetchApi,
};
