import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useEffect } from "react";
import { fetchUsers } from "../features/users/user.slice";
import Loading from "../components/Loading";

export default function UsersPage() {
  const usersList = useSelector((state) => state.user.users);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  return (
    <section className="flex-row h-100 justify-center">
      <h1 className="text-2xl m-5 text-center">Patients List</h1>
      <div className="flex flex-wrap gap-4 justify-center m-5">
        {usersList.data ? (
          usersList.data.length > 0 ? (
            <>
              {usersList.data.map((user) => (
                <Card
                  key={user.id}
                  title={user.username}
                  info={user.email}
                  buttonText="Add Diagnose"
                  linkTo={`/diseases/add/${user.id}`}
                  buttonText2="See Details"
                  linkTo2={`/diseases/users/${user.id}`}
                />
              ))}
            </>
          ) : (
            <div className="text-center">No patients yet.</div>
          )
        ) : (
          <Loading />
        )}
      </div>
    </section>
  );
}
