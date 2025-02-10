import { Fragment } from "react/jsx-runtime";

export interface Links {
  className: string;
  link: React.ReactNode;
}

type DropdownProps = {
  className: string;
  linksDetails: Links[];
  children: React.ReactElement;
};

const Dropdown = ({ className, linksDetails, children }: DropdownProps) => {
  return (
    <Fragment>
      <div className={`${className} dropdown`}>
        <span className="" data-bs-toggle="dropdown" aria-expanded="true">
          {children}
        </span>
        <ul className="dropdown-menu bg-success-subtle border-0 p-0 m-1">
          {linksDetails &&
            linksDetails.map((content, index) => (
              <Fragment key={index}>
                {linksDetails.length - 1 === index && (
                  <hr className="mx-2 my-0 mb-1" />
                )}
                <li className={`dropdown-item ${content.className}`}>
                  {content.link}
                </li>
              </Fragment>
            ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Dropdown;
