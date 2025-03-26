import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useEffect } from "react";
import { fetchUsers } from "../features/users/user.slice";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import { api } from "../helpers/api";

export default function UsersPage() {
  const usersList = useSelector((state) => state.user.users);
  console.log("🐄 - UsersPage - usersList:", usersList);
  const dispatch = useDispatch();

  useEffect(() => {
    // fetchUsers();
    dispatch(fetchUsers());
  }, []);

  return (
    <section>
      <div className="flex flex-wrap gap-4">
        {usersList.data ? (
          <>
            {usersList.data.map((user) => (
              <Card key={user.id} title={user.email} buttonText={user.role} />
            ))}
            <Pagination
              page={usersList.currentPage}
              totalPages={usersList.totalPages}
            />
          </>
        ) : (
          <span className="loading loading-spinner text-primary"></span>
        )}
      </div>
    </section>
  );
}
