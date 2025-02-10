import { TbError404Off } from "react-icons/tb"
import { notFoundLayout } from "../styles"

const NotFound = () => {
  return (
    <>
        <div className={notFoundLayout}>
            <div className="icon404"><TbError404Off size="50%"/></div>
            <div className="text404">Ooops !! page not found</div>
        </div>
    </>
  )
}

export default NotFound