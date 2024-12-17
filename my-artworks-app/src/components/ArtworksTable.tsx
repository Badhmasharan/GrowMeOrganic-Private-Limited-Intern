import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import axios from "axios";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const ArtworksTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const overlayPanelRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number, limit = 12) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`
      );

      const artworks = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin || "Unknown",
        artist_display: item.artist_display || "Not Available",
        inscriptions: item.inscriptions || "None",
        date_start: item.date_start || "N/A",
        date_end: item.date_end || "N/A",
      }));

      setTotalRecords(response.data.pagination.total || 1000);
      return artworks;
    } catch (error) {
      console.error("Error fetching artworks data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (page: number) => {
    const pageData = await fetchArtworks(page);
    setData(pageData);
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const onSelectionChange = (e: any) => {
    setSelectedRows(e.value);
  };

  const handleRowSelection = async () => {
    const count = parseInt(rowCount, 10);

    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid positive number!");
      return;
    }

    let selected = [...selectedRows];
    let availableRows = [...data];
    let nextPage = currentPage;

 
    while (selected.length < count) {
      const remainingRows = availableRows.slice(0, count - selected.length);
      selected = [...selected, ...remainingRows];

      if (selected.length >= count) break;

      nextPage += 1;
      const nextPageData = await fetchArtworks(nextPage);

      if (nextPageData.length === 0) break; 
      availableRows = [...nextPageData];
    }

    setSelectedRows(selected.slice(0, count));
    overlayPanelRef.current?.hide();
  };

 
  const onPageChange = async (e: any) => {
    const newPage = e.page + 1;
    setCurrentPage(newPage);
    loadData(newPage);
  };

  return (
    <div>
      <DataTable
        value={data}
        paginator
        rows={12}
        totalRecords={totalRecords}
        first={(currentPage - 1) * 12}
        onPage={onPageChange}
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        selectionMode="checkbox"
        dataKey="id"
        loading={loading}
        lazy
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem", textAlign: "center" }}
        />
        <Column
          field="title"
          header={
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                icon="pi pi-chevron-down"
                onClick={(e) => overlayPanelRef.current?.toggle(e)}
                className="p-button-outlined"
                style={{ marginLeft: "8px" }}
              />
              <span>Title</span>
            </div>
          }
        />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <OverlayPanel ref={overlayPanelRef} className="custom-overlay">
        <div>
          <input
            type="number"
            value={rowCount}
            onChange={(e) => setRowCount(e.target.value)}
            placeholder="Enter No. of rows"
            style={{ marginRight: "8px" }}
          />
          <Button label="Submit" icon="pi pi-check" onClick={handleRowSelection} />
        </div>
      </OverlayPanel>
    </div>
  );
};

export default ArtworksTable;
