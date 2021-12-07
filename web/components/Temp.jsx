'use strict'

import React from 'react'
import styled, { css } from 'styled-components'
import isDivisibleBy from 'validator/es/lib/isDivisibleBy'

const Temp = () => {
  return <div id='appMain' className='appFullPage'>
    <div id='mainLayer' className='mainLayer'>
      <div id='appContent' className='appContent'>
        <div id='header' className='header'>
          <NB />
        </div>
        <div id='dataContainer' className='dataContainer'>
          <div id='toolbar' className='PageToolbarStructure'>
            toolbar
          </div>
          <div id='data'>
            table & form
          </div>
        </div>
      </div>
    </div>
  </div>
}

const NB = () => {
  // return <div style={{marginLeft: 'auto', order: '2'}}>
  return <div>
    <ul className='nav justify-content-center'>
      <li className='nav-item'>
        <a className='nav-link active' aria-current='page' href='#'>Transactions</a>
      </li>
      <li className='nav-item'>
        <a className='nav-link' href='#'>Dashboard</a>
      </li>
      <li className='nav-item'>
        <a className='nav-link' href='#'>Settings</a>
      </li>
    </ul>
  </div>
}

const Temp1 = () => {
  // return <div id={'1'} style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: 'yellow' }}>
  return <div id='appMain' className='appFullPage'>
    <div id='mainLayer' style={{
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'blue',
      fontSize: '13px',
      color: 'white'
    }}>
      <div id={'3'} style={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        backgroundColor: 'red',
        color: 'black'
      }}>
        <div style={{ display: 'flex', backgroundColor: 'grey' }}>Header</div>
        <div
          style={{ display: 'flex', backgroundColor: 'pink', margin: '10px', flex: '1 1 0', flexDirection: 'column' }}>
          <h1>Content</h1>
          <div style={{ display: 'flex', position: 'relative', backgroundColor: 'yellowgreen' }}>
            Tool Bar
          </div>
          <div style={{
            display: 'flex',
            position: 'relative',
            backgroundColor: 'yellow',
            flex: '1 1 0',
            flexDirection: 'row',
            overflow: 'auto'
          }}>
            {/*<div className='d-flex flex-row p-2 position-relative bg-primary' style={{flex: '1 1 0'}}>*/}
            <div className='bg-white p-1' style={{ flex: '1 1 0', position: 'relative' }}>
              <div
                className='text-normal border'
                style={{
                  alignSelf: 'stretch',
                  position: 'absolute',
                  bottom: '0',
                  top: '0',
                  width: '100%',
                  flex: '1 1 0',
                  overflowX: 'auto',
                  display: 'flex',
                  alignItems: 'stretch'
                }}>
                <table className='table' style={{ display: 'table' }}>
                  <thead style={{ display: 'table-header-group' }}>
                    <tr style={{ display: 'table-row' }}>
                      <th style={{ display: 'table-cell', position: 'sticky', top: '0' }}>#</th>
                      <th style={{ display: 'table-cell', position: 'sticky', top: '0' }}>First</th>
                      <th style={{ display: 'table-cell', position: 'sticky', top: '0' }}>Last</th>
                      <th style={{ display: 'table-cell', position: 'sticky', top: '0' }}>Handle</th>
                    </tr>
                  </thead>
                  <tbody style={{ display: 'table-row-group', overflow: 'auto' }}>
                    <tr style={{ display: 'table-row' }}>
                      <th style={{ display: 'table-cell' }}>1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <th scope='row'>2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                    <tr>
                      <th scope='row'>3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className='bg-white p-1' style={{ flex: '0 0 450px' }}>
              <div className='bg-light text-dark border p-2'>
                <form className='col-form-label-sm'>
                  <div className='form-group row'>
                    <label htmlFor='postedDate' className='col-sm-2 col-form-label'>Date</label>
                    <div className='col-sm-10'>
                      <input className='form-control' id='postedDate' readOnly='' value='Sun, 21 February 2021' />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    Hi
  </div>
}

export default Temp
