'use client'
import { Spreadsheet, Worksheet } from "@jspreadsheet/react";
import { useState, useRef, forwardRef, useEffect } from "react";
import { Search } from "react-feather";
const Modal = forwardRef((props, ref) => {
    
    const [showModal, setShowModal] = useState(false);

    return (
      <>
        <button
          title='Fixture Code Search'
          type="button"
          onClick={() => setShowModal(true)}
        ><Search size={32}></Search>
        </button>
        {showModal ? (
          <>
            <div
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none w-full"
            >
              <div className="relative w-auto  min-w-fit">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                    <h3 className="text-3xl font-semibold">
                      Fixture Code Search
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 w-full max-h-96 overflow-y-scroll">
                    <Spreadsheet ref={ref}>
                  <Worksheet csv='FixtureCodes.csv'
                  search
                  minDimensions={[9,1]}
                pagination="20"
                paginationOptions={[10,15, 20, 50]}
                />
                </Spreadsheet>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <button
                      className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        ) : null}
      </>
    );
  }
)

export default Modal;

